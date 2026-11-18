import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "../components/site/Layout";
import { pageHead, pageTitle } from "../components/site/seo";

export const Route = createFileRoute("/submissions")({
  head: () =>
    pageHead({
      title: pageTitle("Submissions"),
      description:
        "Maple & Pine Press is not reading new manuscripts at the moment. This page will say when submissions reopen.",
      path: "/submissions",
    }),
  component: Submissions,
});

// Submissions are closed. The query form was removed from this page on 18 Nov 2026; the
// server function that stored queries (submitManuscriptQuery) is still in
// lib/api/site.functions.ts, so the form can be put back from the git history when the
// press reopens.
function Submissions() {
  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>Submissions</h1>
          <p>Submissions are currently closed.</p>
        </div>
      </div>
      <div className="wrap">
        <div className="subgrid">
          <div>
            <h2>Submissions Are Currently Closed</h2>
            <p>
              Maple &amp; Pine Press is not reading new manuscripts at the moment. We are a small
              press and our list is full for the coming year.
            </p>
            <p>
              Please do not send queries or manuscripts by email, as we are unable to reply to them.
              When we reopen, the details will be posted on this page.
            </p>
          </div>
          <div className="sform">
            <h2 style={{ fontFamily: "inherit" }}>Already sent us a query?</h2>
            <p style={{ color: "#4a453e" }}>
              Queries we received before submissions closed are still being read. If you have a
              reference number, you can check on yours any time on our{" "}
              <Link to="/toolkit">Author Toolkit</Link> page.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
