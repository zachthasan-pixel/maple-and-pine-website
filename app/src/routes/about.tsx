import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "../components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Hasan Publishing" },
      {
        name: "description",
        content:
          "Hasan Publishing is an independent press founded in Tokyo by Dr. Zahir Hasan, publishing serious nonfiction and illustrated children's books.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <div className="pagehead">
        <div className="wrap">
          <h1>About Hasan Publishing</h1>
          <p>
            An independent press founded in Tokyo, publishing serious nonfiction and beautiful
            children's books with equal care.
          </p>
        </div>
      </div>
      <div className="wrap">
        <div className="about2col">
          <div>
            <h2>Our Story</h2>
            <p>
              Hasan Publishing began the way many good presses do: with books that needed to
              exist and an author willing to learn every step of making them. The manuscript,
              the typesetting, the covers, the distribution. What started as a personal imprint
              has grown into something with a broader mission.
            </p>
            <p>
              We publish across two lists. Our <b>nonfiction list</b> takes on questions of
              policy, law, and international affairs with analytical rigor and a commitment to
              evidence over polemic. Our <b>children's list</b> produces warmly illustrated
              picture books that respect young readers.
            </p>
            <p>
              Every title is distributed worldwide in ebook and print, and we are now opening
              our doors to other authors whose work deserves the same careful treatment.
            </p>
            <h2 style={{ marginTop: 36 }}>What We Believe</h2>
            <p>
              That small presses can meet the production standards of large ones. That serious
              analysis and accessible writing are not opposites. And that an author's
              relationship with their publisher should be a collaboration, not a transaction.
            </p>
          </div>
          <div className="founder">
            <div className="init">ZH</div>
            <h3>Dr. Zahir Hasan</h3>
            <div className="role">Founder &amp; Publisher</div>
            <p style={{ color: "#4a453e", fontSize: 15.5, marginBottom: 18 }}>
              A Canadian academic based in Tokyo, Dr. Hasan teaches at the university level and
              writes across policy, law, and children's literature. His education spans the
              United States and Europe.
            </p>
            <div className="creds">
              <span>B.A. Economics &amp; Political Science</span>
              <span>M.P.P.A. Public Policy &amp; Administration</span>
              <span>LL.M. Law</span>
              <span>Ed.D. Education</span>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
