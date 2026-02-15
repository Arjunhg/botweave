
import EmbedCard from '@/components/EmbedCard'
import { getUserSession } from '@/lib/getUserSession'


 async function page  () {
    const session =await getUserSession()
  return (
    <>
    <EmbedCard ownerId={session?.user?.id!}/>

    </>
  )
}

export default page