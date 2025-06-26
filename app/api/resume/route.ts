import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // For now, we'll return a simple text response
    // In production, you'd serve an actual PDF file
    const resumeContent = `James Ross
Staff Software Engineer | Game Infrastructure & Engine Architecture

CONTACT
Email: james@flyingrobots.dev
Phone: (425) 405-0593
LinkedIn: linkedin.com/in/flyingrobots
GitHub: github.com/flyingrobots

SUMMARY
18 years building game infrastructure that scales. From custom MMO engines to ML platforms 
processing billions of player events. I solve the complex technical problems so game teams 
can focus on creating great player experiences.

EXPERIENCE
[Full resume content would go here...]

For the complete PDF version, please contact me directly.`

    return new NextResponse(resumeContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="james-ross-resume.txt"',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to download resume' }, { status: 500 })
  }
}