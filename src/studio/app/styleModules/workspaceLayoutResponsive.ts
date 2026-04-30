export const workspaceLayoutResponsiveStyles = `    @media (min-width: 1600px) and (min-aspect-ratio: 8 / 5) {
      .studio-body {
        grid-template-columns: 248px minmax(0, 1fr) 456px;
      }

      .studio-sidebar--right {
        padding: 10px 12px;
      }

      .studio-nav {
        padding: 8px 16px 12px;
      }

      .studio-map-tools {
        margin: 4px 16px 14px;
      }

      .studio-stage {
        grid-template-rows: 44px minmax(0, 1fr);
      }

      .studio-stage__toolbar {
        padding: 5px 10px;
        gap: 6px;
      }

      .studio-map-controls {
        width: 100%;
        min-height: 34px;
        padding: 4px;
        gap: 6px;
        border-radius: 12px;
      }

      .studio-field--compact select {
        min-width: 154px;
        height: 30px;
      }

      .studio-segment--viewport {
        min-height: 30px;
      }

      .studio-segment--viewport .studio-segment__button,
      .studio-stage__toolbar .studio-chip {
        min-height: 28px;
        height: 28px;
        padding-inline: 10px;
      }

      .studio-stage__viewport {
        padding: 6px 10px 8px;
      }
    }
`;
