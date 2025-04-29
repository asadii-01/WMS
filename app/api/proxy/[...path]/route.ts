import { type NextRequest, NextResponse } from "next/server"

// This is a proxy API route that forwards requests to the backend server
export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const url = new URL(request.url)
  const queryString = url.search

  try {
    const response = await fetch(`http://localhost:3000/api/${path}${queryString}`)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error proxying GET request to /${path}:`, error)
    return NextResponse.json({ error: "Failed to fetch data from backend" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const body = await request.json()

  try {
    const response = await fetch(`http://localhost:3000/api/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`Error proxying POST request to /${path}:`, error)
    return NextResponse.json({ error: "Failed to send data to backend" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")
  const body = await request.json()

  try {
    const response = await fetch(`http://localhost:3000/api/${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`Error proxying PUT request to /${path}:`, error)
    return NextResponse.json({ error: "Failed to update data on backend" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/")

  try {
    const response = await fetch(`http://localhost:3000/api/${path}`, {
      method: "DELETE",
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`Error proxying DELETE request to /${path}:`, error)
    return NextResponse.json({ error: "Failed to delete data on backend" }, { status: 500 })
  }
}
