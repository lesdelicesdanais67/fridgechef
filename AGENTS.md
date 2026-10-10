<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the uploaded legacy application isolated in an iframe except for the React home, fridge, and recipe detail screens; this preserves the remaining screens and original source without rewriting them.
- Share navigation, taste, and the existing ingredient storage contract through the iframe adapter; keeping the original HTML unmodified preserves its recipe engine and data.
- Keep fridge ingredients in the existing device-local fc_ing string array, with optional date metadata stored separately; this preserves existing offline storage and avoids a backend migration for a screen-only redesign.
- Apply fridge validation and unrestricted taste through the injected adapter, retaining the original matching and sorting functions; this respects the home selection without replacing the legacy recipe logic.
- Home recipe durations use the original displayed preparation field, not invented total times, because the source assigns every recipe a 30-minute cooking field.
- Keep the legacy frame mounted while React recipe details are open and route its detail clicks through the adapter; this preserves recipe list filters, pagination, and return state.
- Read recipe ingredients, base servings, dietary badges and steps directly from the original catalogue, and derive timers only from explicit step durations; this prevents invented recipe facts.
- Store recipe shopping additions in a separate device-local list accessible from the recipe detail dialog; the uploaded application has no Courses screen to alter.
