import { signIn, signOut, useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div>
      {!session ? (
        <button onClick={() => signIn("twitter")}>Login with Twitter</button>
      ) : (
        <>
          <p>Signed in as {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </div>
  )
}
