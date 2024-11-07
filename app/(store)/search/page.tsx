async function Page({searchParams}: {searchParams: {query: string}}) {
  const { query } = await searchParams;
  return (
    <div>Results for {query}</div>
  )
}

export default Page