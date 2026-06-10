import type { Route } from "./+types/contact";
import { RiArrowDownSLine } from "react-icons/ri";

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
        <h1 className="mt-12 mb-2 text-2xl text-amber-950">Contact Us Here!</h1>
        <p className="text-amber-800/84 mb-12 tracking-wide">
          Any questions or suggestions?
        </p>
        {/* TODO: Form handling */}
        <form
          action=""
          onSubmit={(e) => e.preventDefault()}
          className="stack-6 max-w-lg mx-auto mb-24 p-6 rounded-lg bg-amber-100/74 shadow-lg
          gen-form-labels"
        >
          <fieldset>
            <label htmlFor="email">Your Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              className="gen-input-forms"
            />
          </fieldset>
          <fieldset>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="mx-2 max-h-[10lh] gen-input-forms"
            ></textarea>
          </fieldset>

          <fieldset>
            <p className="text-center">Were you satisfied with our service?</p>
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
            className="ml-auto px-4 py-2 bg-amber-200/36 gen-btn-border rounded-md
            text-amber-900 font-medium shadow-md gen-btn-hovaction-sm"
          >
            Submit Form
          </button>
        </form>

        <div className="stack-4 mt-8 min-h-112">
          <h2 className="text-xl mb-4 text-amber-800">
            Directly Given Assertions
          </h2>
          <details name="assertion" className="details-card group">
            <summary className="details-summary">
              Are these properties real?
              <RiArrowDownSLine size={30} className="details-icon" />
            </summary>
            <div className="details-content">
              Not particularly "<span className="font-sans-italic">real</span>."
              This is a software project rather than a legitimate Real Estate
              website. There is no company behind it all.
            </div>
          </details>
          <details name="assertion" className="details-card group">
            <summary className="details-summary">
              Are the prices real?
              <RiArrowDownSLine size={30} className="details-icon" />
            </summary>
            <div className="details-content">
              Yes. The prices are actually real! Only that they refer not to
              real properties that verifiably exist.
            </div>
          </details>
          <details name="assertion" className="details-card group">
            <summary className="details-summary">
              Can I use the website as normal?
              <RiArrowDownSLine size={30} className="details-icon" />
            </summary>
            <div className="details-content">
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
            </div>
          </details>
        </div>
      </div>
      <HeroRightSide />
    </main>
  );
}
