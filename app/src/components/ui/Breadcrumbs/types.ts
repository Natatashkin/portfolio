// One step of the trail after `Home`. Without `href` it renders as text; the last step is never a link.
export type BreadcrumbItem = {
  label: string;
  href?: string;
};
