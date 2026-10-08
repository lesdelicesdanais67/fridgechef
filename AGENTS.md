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

- Keep the uploaded legacy application isolated in an iframe for non-home screens; this preserves its original styling, data, storage, and functions without rewriting them.
- Implement the home screen in React and share only navigation and the selected taste with the legacy application; the legacy HTML remains unmodified source material.
- Home recipe durations use the original displayed preparation field, not invented total times, because the source assigns every recipe a 30-minute cooking field.
