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
        <h1 className="my-12 text-2xl">Contact Us Here!</h1>
        <form
          action=""
          onSubmit={(e) => e.preventDefault()}
          className="stack-6 mb-12 p-4 roudned-lg bg-amber-100/48 [&_fieldset]:stack-0 [&_label]:text-lg"
        >
          <fieldset>
            <label htmlFor="email">Your Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              className="mx-4 px-2 py-3 border-b border-amber-950/36 shadow-sm inset-shadow-xs"
            />
          </fieldset>
          <fieldset>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="mx-4 px-2 py-3 max-h-[10lh] border-b border-amber-950/36 rounded-md shadow-sm inset-shadow-xs"
            ></textarea>
          </fieldset>

          <fieldset>
            <p className="text-lg text-center">
              Were you satisfied with our service?
            </p>
            <div className="flex justify-around [&_div]:flex [&_input]:w-6">
              <div>
                <label htmlFor="says-no">No</label>
                <input
                  id="says-no"
                  name="says"
                  value="no"
                  type="radio"
                  className="accent-rose-500"
                />
              </div>
              <div>
                <label htmlFor="says-yes">Yes</label>
                <input
                  id="says-yes"
                  name="says"
                  value="yes"
                  type="radio"
                  className="accent-emerald-600"
                />
              </div>
            </div>
          </fieldset>
          <button
            type="submit"
            className="ml-auto px-4 py-2 bg-amber-200/36 border border-amber-300 rounded-md
            text-amber-700 shadow-md gen-btn-hovaction-sm"
          >
            Submit Form
          </button>
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
