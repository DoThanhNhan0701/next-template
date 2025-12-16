import HomePage from "@/components/pages/home";

export default async function Home() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <HomePage />;
}
