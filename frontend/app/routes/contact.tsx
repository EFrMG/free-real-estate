import type { Route } from "./+types/contact";

import HeroRightSide from "~/components/HeroRightSide";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function Contact() {
  return (
    <main className="gen-main">
      <div className="gen-left">
        <h1 className="text-2xl">Contact Us Here</h1>
        <form action="">
          <fieldset>
            <label htmlFor="email">Your Email:</label>
            <input id="email" name="email" type="email" />
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message"></textarea>
          </fieldset>

          <fieldset>
            <p>Were you satisfied with our service?</p>
            <label htmlFor="says-yes">Yes</label>
            <input id="says-yes" name="says-yes" value="yes" type="checkbox" />
            <label htmlFor="says-no">No</label>
            <input id="says-no" name="says-no" value="no" type="checkbox" />
          </fieldset>
        </form>

        <div>
          <h2 className="text-xl">Directly Given Assertions</h2>
          <details>
            <summary>Are these properties real?</summary>
            Not particularly "real." This is a software project rather than a
            legitimate Real Estate website. There is no company behind it all.
          </details>
          <details>
            <summary>Are the prices real?</summary>
            Yes. The prices are actually real! Only that they refer not to real
            properties that verifiably exist.
          </details>
          <details>
            <summary>Can I use the website as normal?</summary>
            Absolutely! Also, in case you find any issues or would like to see
            more features I encourage you to tell me about them on{" "}
            <a
              target="_blank"
              href="https://github.com/EFrMG/free-real-state"
              className="outside-link"
            >
              the public repository
            </a>
            . Thank you in advance and be well.
          </details>
        </div>
      </div>
      <HeroRightSide />
    </main>
  );
}
