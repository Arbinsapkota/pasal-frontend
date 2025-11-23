// types/custom-elements.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'vaadin-rich-text-editor': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      value?: string;
    };
  }
}
