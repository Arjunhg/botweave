import DashboardHome from "@/components/dashboard/DashboardHome";
import { getUserSession } from "@/lib/getUserSession"

export default async function DashboardPage() {

    const session = await getUserSession();

    return(
        <DashboardHome ownerId={session?.user?.id}/>
    )
}