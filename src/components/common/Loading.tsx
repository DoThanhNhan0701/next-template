import { Spinner } from "@/components/ui/spinner";

interface Props {
  className?: string;
}

export default function Loading({ className }: Readonly<Props>) {
  return (
    <div className={className}>
      <Spinner className="size-6" />
    </div>
  );
}
