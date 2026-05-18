# Green Hours

> Repo `grid-window`, app name **Green Hours**.

Green Hours tells you the cleanest time in the next 48 hours to run something
power-hungry, like a dishwasher or an EV charge. UK grid electricity is dirtier
at some hours than others depending on the wind, solar and gas mix, so shifting
a flexible load to a cleaner hour cuts CO2 for the same task and the same cost.

It turns the live carbon-intensity forecast into one line you can act on:

> "Start your dishwasher at 01:00. That's 38% less CO2 than running it now."

At the core is the optimiser: a pure function that slides a window across the
forecast to find the cleanest contiguous block for a given run length.

## Running it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm test         # run the test suite
```

## Testing

The optimiser is a pure function, so its edge cases are covered directly: a
window straddling "now", a forecast shorter than the run length, ties broken to
the earlier window, missing or empty data. `npm test` runs the suite (41 tests),
`npm run coverage` reports it. Current coverage is 97% of statements.

## Stack

React 18, TypeScript, Vite, Recharts, Vitest + React Testing Library. Data from
the free [UK Carbon Intensity API](https://carbonintensity.org.uk/).
