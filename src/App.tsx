import { useForecast } from "./hooks/useForecast";
import { useOptimiser } from "./hooks/useOptimiser";
import { Headline } from "./components/Headline";
import { Optimiser } from "./components/Optimiser";
import { ForecastChart } from "./components/ForecastChart";
import { Explainer } from "./components/Explainer";
import "./App.css";

const App = () => {
  const { state, refresh } = useForecast();

  // useOptimiser must run unconditionally, so feed it an empty forecast
  // until the real one has loaded.
  const forecast =
    state.status === "ready" || state.status === "stale" ? state.forecast : [];
  const { appliance, runHours, recommendation, selectAppliance, setRunHours } =
    useOptimiser(forecast);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__inner">
          <h1 className="hero__title">
            <span className="hero__title-accent">Green</span> Hours
          </h1>
          <p className="hero__tagline">
            The greenest time to run your appliances
          </p>
          <p className="hero__intro">
            UK electricity is cleaner at some hours than others. Wind and solar
            push emissions down, gas pushes them up. Run flexible appliances
            when the grid is cleanest and you cut CO₂ for free, with no change
            to your bill.
          </p>
          <Explainer />
        </div>
      </header>

      <main className="app__main">
        {state.status === "loading" && (
          <p className="notice notice--loading" role="status">
            Loading the latest grid forecast…
          </p>
        )}

        {state.status === "error" && (
          <div className="notice notice--error" role="alert">
            <p>Couldn't reach the grid data. {state.message}</p>
            <button type="button" onClick={refresh}>
              Try again
            </button>
          </div>
        )}

        {(state.status === "ready" || state.status === "stale") && (
          <>
            {state.status === "stale" && (
              <div className="notice notice--stale" role="alert">
                <p>
                  This forecast is over an hour old. Refresh before trusting the
                  recommendation.
                </p>
                <button type="button" onClick={refresh}>
                  Refresh
                </button>
              </div>
            )}

            <Headline
              forecast={state.forecast}
              fetchedAt={state.fetchedAt}
              stale={state.status === "stale"}
            />
            <Optimiser
              appliance={appliance}
              runHours={runHours}
              recommendation={recommendation}
              onSelectAppliance={selectAppliance}
              onSelectRunHours={setRunHours}
            />
            <ForecastChart
              forecast={state.forecast}
              recommendation={recommendation}
            />
          </>
        )}
      </main>

      <footer className="app__footer">
        <p>
          Data:{" "}
          <a href="https://carbonintensity.org.uk/" target="_blank" rel="noreferrer">
            UK Carbon Intensity API
          </a>
          . Carbon intensity, not price. Your bill is unchanged.
        </p>
      </footer>
    </div>
  );
};

export default App;
