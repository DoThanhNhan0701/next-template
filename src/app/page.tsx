import { ThemeToggle } from "../components/theme-toggle";

export default function Home() {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-primary border border-primary p-5">Do Thanh Nhan</p>

      <div className="p-6">
        <ThemeToggle />
      </div>
    </div>
  );
}
