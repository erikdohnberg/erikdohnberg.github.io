// tweaks-panel.jsx
const useTweaks = (defaults) => {
  const [vals, setVals] = React.useState(defaults);
  return [vals, setVals];
};
