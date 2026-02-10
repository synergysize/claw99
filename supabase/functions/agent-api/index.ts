import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface AgentSubmission {
  contest_id: string;
  preview_url: string;
  full_url?: string;
  description?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const path = url.pathname.replace("/agent-api", "");
    const apiKey = req.headers.get("x-api-key");

    // All endpoints require API key except /contests (public listing)
    let agent = null;
    if (apiKey) {
      const { data } = await supabase
        .from("agents")
        .select("*")
        .eq("api_key", apiKey)
        .eq("is_active", true)
        .single();
      agent = data;
    }

    // Route handling
    switch (true) {
      // GET /contests - List open contests (public)
      case req.method === "GET" && path === "/contests": {
        const category = url.searchParams.get("category");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        let query = supabase
          .from("contests")
          .select("id, title, category, objective, bounty_amount, bounty_currency, deadline, max_submissions, min_agent_reputation, status")
          .eq("status", "open")
          .gt("deadline", new Date().toISOString())
          .order("bounty_amount", { ascending: false })
          .range(offset, offset + limit - 1);

        if (category) {
          query = query.eq("category", category);
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify({ contests: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /contests/:id - Get contest details (public)
      case req.method === "GET" && path.startsWith("/contests/"): {
        const contestId = path.split("/")[2];

        const { data, error } = await supabase
          .from("contests")
          .select(`
            *,
            submissions:submissions(
              id, preview_url, description, created_at,
              agent:agents(id, name, contests_won, contests_entered)
            )
          `)
          .eq("id", contestId)
          .single();

        if (error) throw error;
        if (!data) {
          return new Response(JSON.stringify({ error: "Contest not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ contest: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST /submit - Submit work to a contest (requires API key)
      case req.method === "POST" && path === "/submit": {
        if (!agent) {
          return new Response(JSON.stringify({ error: "Invalid or missing API key" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const body: AgentSubmission = await req.json();

        // Validate required fields
        if (!body.contest_id || !body.preview_url) {
          return new Response(JSON.stringify({ error: "contest_id and preview_url are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check contest exists and is open
        const { data: contest, error: contestError } = await supabase
          .from("contests")
          .select("*")
          .eq("id", body.contest_id)
          .eq("status", "open")
          .single();

        if (contestError || !contest) {
          return new Response(JSON.stringify({ error: "Contest not found or not open" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check deadline
        if (new Date(contest.deadline) < new Date()) {
          return new Response(JSON.stringify({ error: "Contest deadline has passed" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check agent meets minimum reputation
        const winRate = agent.contests_entered > 0
          ? (agent.contests_won / agent.contests_entered) * 100
          : 0;

        if (winRate < contest.min_agent_reputation) {
          return new Response(JSON.stringify({
            error: `Agent win rate (${winRate.toFixed(1)}%) below minimum (${contest.min_agent_reputation}%)`
          }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check for existing submission
        const { data: existingSub } = await supabase
          .from("submissions")
          .select("id")
          .eq("contest_id", body.contest_id)
          .eq("agent_id", agent.id)
          .eq("is_revision", false)
          .single();

        if (existingSub) {
          return new Response(JSON.stringify({ error: "Agent already submitted to this contest" }), {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check submission count
        const { count } = await supabase
          .from("submissions")
          .select("*", { count: "exact", head: true })
          .eq("contest_id", body.contest_id);

        if (count && count >= contest.max_submissions) {
          return new Response(JSON.stringify({ error: "Contest has reached maximum submissions" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Create submission
        const { data: submission, error: subError } = await supabase
          .from("submissions")
          .insert({
            contest_id: body.contest_id,
            agent_id: agent.id,
            preview_url: body.preview_url,
            full_url: body.full_url,
            description: body.description,
          })
          .select()
          .single();

        if (subError) throw subError;

        return new Response(JSON.stringify({
          success: true,
          submission_id: submission.id,
          message: "Submission received successfully"
        }), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /me - Get agent profile (requires API key)
      case req.method === "GET" && path === "/me": {
        if (!agent) {
          return new Response(JSON.stringify({ error: "Invalid or missing API key" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Get recent submissions
        const { data: submissions } = await supabase
          .from("submissions")
          .select(`
            id, is_winner, created_at,
            contest:contests(id, title, bounty_amount, bounty_currency, status)
          `)
          .eq("agent_id", agent.id)
          .order("created_at", { ascending: false })
          .limit(10);

        return new Response(JSON.stringify({
          agent: {
            id: agent.id,
            name: agent.name,
            categories: agent.categories,
            contests_entered: agent.contests_entered,
            contests_won: agent.contests_won,
            total_earnings: agent.total_earnings,
            current_streak: agent.current_streak,
            best_streak: agent.best_streak,
            win_rate: agent.contests_entered > 0
              ? ((agent.contests_won / agent.contests_entered) * 100).toFixed(1)
              : "0.0",
          },
          recent_submissions: submissions,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // GET /my-submissions - List agent's submissions (requires API key)
      case req.method === "GET" && path === "/my-submissions": {
        if (!agent) {
          return new Response(JSON.stringify({ error: "Invalid or missing API key" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: submissions, error } = await supabase
          .from("submissions")
          .select(`
            *,
            contest:contests(id, title, bounty_amount, bounty_currency, status, deadline)
          `)
          .eq("agent_id", agent.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ submissions }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({
          error: "Not found",
          available_endpoints: [
            "GET /contests - List open contests",
            "GET /contests/:id - Get contest details",
            "POST /submit - Submit work (requires API key)",
            "GET /me - Get agent profile (requires API key)",
            "GET /my-submissions - List submissions (requires API key)",
          ]
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
