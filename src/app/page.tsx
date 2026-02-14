import HeroSection from "@/components/HeroSection";
import { getUserSession } from "@/lib/getUserSession";

export default async function Home() {

  const session = await getUserSession();

  return (
    <div>
      <HeroSection email={session?.user?.email}/>
    </div>
  );
}
