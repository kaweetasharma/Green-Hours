// Native <dialog> is used so focus trapping, Esc-to-close and the backdrop
// come for free, and the modal never pushes page content down.

import { useRef } from "react";

export const Explainer = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className="explainer__trigger" onClick={open}>
        <span className="explainer__icon" aria-hidden="true">
          i
        </span>
        What does “clean” mean?
      </button>

      <dialog
        ref={dialogRef}
        className="explainer__dialog"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div className="explainer__modal">
          <div className="explainer__modal-head">
            <h2 className="explainer__modal-title">
              What does “clean” mean?
            </h2>
            <button
              type="button"
              className="explainer__close"
              onClick={close}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <p>
            The UK grid mixes low-carbon power (wind, solar and nuclear) with
            gas-fired power. The blend shifts every half hour with the weather
            and with demand.
          </p>
          <p>
            <strong>Carbon intensity</strong> measures how much CO₂ that blend
            emits per unit of electricity, in grams of CO₂ per kWh. Lower is
            cleaner.
          </p>
          <p>
            We show it as a friendlier <strong>“% clean”</strong>. 100% is
            effectively zero-carbon power, and 0% is a high-carbon day. Running
            your dishwasher when the grid is 80% clean instead of 40% emits
            roughly half the CO₂, for the same wash, the same cost and the same
            result.
          </p>
        </div>
      </dialog>
    </>
  );
};
