import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/utils/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get system prompt from configurations table
    const { data: config } = await supabase
      .from('configurations')
      .select('system_prompt')
      .single()

    const systemPrompt = config?.system_prompt || 'You are an AI assistant that helps create engaging bi-weekly digest content.'

    // Check if we have existing blogs
    const { data: existingBlogs } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    // If no blogs exist or system prompt changed, generate new ones
    if (!existingBlogs || existingBlogs.length === 0) {
      await generateBlogsFromSystemPrompt(supabase, systemPrompt)
      
      // Fetch the newly created blogs
      const { data: newBlogs } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })

      return NextResponse.json({ blogs: newBlogs || [] })
    }

    return NextResponse.json({ blogs: existingBlogs })
  } catch (error) {
    console.error('Blogs API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

async function generateBlogsFromSystemPrompt(supabase: Awaited<ReturnType<typeof createClient>>, systemPrompt: string) {
  try {
    // Analyze the system prompt to determine content theme
    const themeAnalysis = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze the following system prompt and identify the main theme, domain, and key concepts. Respond with a JSON object containing: theme, domain, keyTopics (array), and suggestedBlogTitles (array of 3 titles).'
        },
        {
          role: 'user',
          content: systemPrompt
        }
      ],
      temperature: 0.3,
    })

    const analysis = JSON.parse(themeAnalysis.choices[0].message.content || '{}')
    
    // Generate blog posts based on the theme
    const blogPromises = analysis.suggestedBlogTitles?.slice(0, 3).map(async (title: string) => {
      const content = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert content creator. Based on the following system prompt context, create engaging blog content that aligns with the theme and expertise described. Write in a professional, informative style suitable for the domain.

System Context: ${systemPrompt}

Create a comprehensive blog post that demonstrates the expertise and approach described in the system prompt.`
          },
          {
            role: 'user',
            content: `Write a detailed blog post with the title: "${title}"

Structure it with:
1. Introduction
2. Key insights/analysis
3. Practical implications
4. Conclusion

Make it informative and engaging, around 600-800 words.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })

      return {
        title,
        content: content.choices[0].message.content || '',
      }
    }) || []

    const blogs = await Promise.all(blogPromises)

    // Insert blogs into database
    for (const blog of blogs) {
      await supabase
        .from('blogs')
        .insert({
          title: blog.title,
          content: blog.content,
        })
    }

  } catch (error) {
    console.error('Error generating blogs:', error)
    // Create fallback content if AI generation fails
    const fallbackBlogs = [
      {
        title: 'Welcome to Our Dynamic Blog',
        content: `# Welcome to Our Dynamic Blog

This blog is powered by AI and dynamically generates content based on our current system configuration.

## How It Works

Our blog system:
- Analyzes the current system prompt
- Identifies key themes and topics
- Generates relevant, engaging content
- Updates automatically when the system prompt changes

## Current Theme

Based on our system configuration, this blog focuses on providing insights and analysis that align with our AI assistant's current expertise and domain knowledge.

Stay tuned for more dynamic content as our system evolves!`,
      }
    ]

    for (const blog of fallbackBlogs) {
      await supabase
        .from('blogs')
        .insert({
          title: blog.title,
          content: blog.content,
        })
    }
  }
}