// Full-page "loading screen" — the speeder/clouds animation, recolored to
// the Team Brz brand. See app/globals.css for the CSS (Uiverse.io by
// anand_4957). Used for route-level loading states (loading.tsx files),
// not the small inline Spinner used inside buttons/forms.
export default function PageLoader() {
  return (
    <div className="brz-loader-scene" role="status" aria-label="Loading">
      <div className="brz-clouds">
        <div className="brz-cloud brz-cloud1" />
        <div className="brz-cloud brz-cloud2" />
        <div className="brz-cloud brz-cloud3" />
        <div className="brz-cloud brz-cloud4" />
        <div className="brz-cloud brz-cloud5" />
      </div>

      <div className="brz-longfazers">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="brz-speeder">
        <span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </span>
        <div className="brz-speeder-base">
          <span></span>
          <div className="brz-speeder-face" />
        </div>
      </div>
    </div>
  );
}
