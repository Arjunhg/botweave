import EmbedCard from '@/components/EmbedCard'
import { getUserSession } from '@/lib/getUserSession'
import { redirect } from 'next/navigation';


async function page() {
    const session = await getUserSession();
    const ownerId = session?.user?.id;

    if (!ownerId) {
        redirect("/?error=unauthenticated");
    }

    return <EmbedCard ownerId={ownerId} />;
}

export default page
