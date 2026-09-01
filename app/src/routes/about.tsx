import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "../components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · Maple & Pine Press" },
      {
        name: "description",
        content:
          "Maple & Pine Press is an independent press founded in Tokyo by Dr. Zahir Hasan, publishing politics and international affairs, education, fantasy fiction, and illustrated children's books.",
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
          <h1>About Maple & Pine Press</h1>
          <p>
            An independent press founded in Tokyo, publishing across four lists — politics,
            education, fiction, and children's books — with equal care given to each.
          </p>
        </div>
      </div>
      <div className="wrap">
        <div className="about2col">
          <div>
            <h2>Our Story</h2>
            <p>
              Maple & Pine Press began the way many good presses do: with books that needed to
              exist and an author willing to learn every step of making them. The manuscript,
              the typesetting, the covers, the distribution. What started as a personal imprint
              has grown into something with a broader mission.
            </p>
            <p>
              The name joins our two homes. The maple stands for Canada, where our founder is
              from; the pine for Japan, where we publish today. In Japanese tradition the pine,
              <i> matsu</i>, is the tree of endurance and long life, and that is the quality we
              want in every book we make.
            </p>
            <p>
              We publish across four lists. <b>Politics &amp; International Affairs</b> takes on
              questions of policy, law, and security with analytical rigor and a commitment to
              evidence over polemic. <b>Education &amp; Practice</b> is written for teachers,
              students and working professionals — classroom practice, artificial intelligence,
              study skills, everyday law. <b>Fantasy &amp; Speculative Fiction</b> runs from
              epic fantasy to near-future science fiction. And our <b>children's list</b>
              produces warmly illustrated picture books and early-learning workbooks that
              respect young readers.
            </p>
            <p>
              Sixty titles are now in print. Every one is distributed worldwide in ebook and
              paperback, and we are opening our doors to other authors whose work deserves the
              same careful treatment.
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
              writes across policy, law, education, fiction, and children's literature. His
              education spans the United States and Europe.
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
