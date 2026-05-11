/**
 * Sample Blog Post Seeder
 * 
 * Run this script to add sample blog posts to your database:
 * npx medusa exec ./src/scripts/seed-blog.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import type BlogModuleService from "../modules/blog/service"

const samplePosts = [
    {
        title: "৫টি সহজ উপায়ে আপনার পারফিউম দীর্ঘস্থায়ী করুন",
        slug: "perfume-care-tips-bangla",
        excerpt: "আপনার পছন্দের সুগন্ধি সারাদিন ধরে রাখুন এই সহজ টিপস দিয়ে",
        content: `আপনার প্রিয় পারফিউমের সুগন্ধ যেন সারাদিন স্থায়ী হয়, তার জন্য কিছু সহজ কৌশল অনুসরণ করতে পারেন:

১. পালস পয়েন্টে স্প্রে করুন
কবজি, ঘাড়, এবং কানের পেছনে স্প্রে করুন। এই জায়গাগুলোতে রক্ত সঞ্চালন বেশি থাকায় সুগন্ধ ভালো ছড়ায়।

২. ময়েশ্চারাইজড ত্বকে লাগান
শুষ্ক ত্বকের চেয়ে আর্দ্র ত্বকে পারফিউম বেশিক্ষণ থাকে। লোশন লাগানের পর পারফিউম ব্যবহার করুন।

৩. লেয়ারিং করুন
একই সুগন্ধির বডি লোশন এবং পারফিউম একসাথে ব্যবহার করলে সুগন্ধ আরো দীর্ঘস্থায়ী হয়।

৪. কাপড়ে স্প্রে করুন
ত্বকের পাশাপাশি কাপড়েও হালকা স্প্রে করুন। ফেব্রিকে সুগন্ধ বেশিক্ষণ স্থায়ী হয়।

৫. সঠিকভাবে সংরক্ষণ করুন
সরাসরি সূর্যালোক এবং তাপ থেকে দূরে রাখুন। বাথরুমে না রেখে শীতল শুষ্ক জায়গায় সংরক্ষণ করুন।

💜 Alariya থেকে প্রিমিয়াম পারফিউম কালেকশন দেখুন!`,
        author: "Alariya Team",
        published: true,
        published_at: new Date("2026-02-10"),
        meta_title: "পারফিউম দীর্ঘস্থায়ী করার ৫টি সহজ উপায় | Alariya",
        meta_description: "আপনার পছন্দের সুগন্ধি সারাদিন ধরে রাখুন এই সহজ টিপস দিয়ে। Alariya থেকে এক্সপার্ট গাইড।",
    },
    {
        title: "How to Choose the Perfect Perfume for Every Occasion",
        slug: "choosing-perfect-perfume",
        excerpt: "Find your signature scent with our expert guide to selecting fragrances for different occasions.",
        content: `Choosing the right perfume can elevate your presence and leave a lasting impression. Here's how to select the perfect fragrance for every moment:

**For Daily Wear**
Choose light, fresh scents with citrus or floral notes. These are subtle yet refreshing, perfect for office and casual settings.
✓ Citrus-based fragrances
✓ Light florals
✓ Clean, soapy notes

**For Evening & Special Events**
Opt for richer, more complex fragrances with oriental or woody notes. These create a sophisticated, memorable impression.
✓ Oriental spices
✓ Warm vanilla
✓ Deep woods

**For Summer**
Light, aquatic, and fruity fragrances work best in hot weather. They're refreshing and won't be overwhelming.
✓ Ocean & marine notes
✓ Tropical fruits
✓ Green tea

**For Winter**
Warm, spicy, and musky scents complement the cold season perfectly.
✓ Amber & musk
✓ Cinnamon & cloves
✓ Rich chocolate

**Pro Tips:**
• Test on your skin, not paper
• Wait 30 minutes before deciding
• Consider your body chemistry
• Don't rush the decision

Discover our curated collection at Alariya - your perfect scent awaits! 💜`,
        author: "Alariya Team",
        published: true,
        published_at: new Date("2026-02-12"),
        meta_title: "How to Choose the Perfect Perfume | Expert Guide",
        meta_description: "Learn how to select the ideal fragrance for every occasion with our expert perfume selection guide.",
    },
    {
        title: "The Art of Perfume: Understanding Fragrance Notes",
        slug: "understanding-fragrance-notes",
        excerpt: "Decode the mystery of top, middle, and base notes in perfumes.",
        content: `Understanding fragrance notes is the key to finding your perfect scent. Let's explore the three layers that make up every perfume:

**Top Notes (First 15 minutes)**
The initial impression of a fragrance. Light and volatile, these evaporate quickly.
Common top notes:
• Citrus (lemon, bergamot, orange)
• Light fruits
• Herbs (basil, mint)

**Middle Notes (30 minutes - 3 hours)**
The heart of the fragrance that emerges as top notes fade. This is the main character.
Common middle notes:
• Floral (rose, jasmine, lavender)
• Spices (cinnamon, cardamom)
• Green notes

**Base Notes (3+ hours)**
The foundation that gives depth and longevity. These linger the longest.
Common base notes:
• Woods (sandalwood, cedar)
• Musk
• Vanilla
• Amber

**Understanding Note Families:**

🌸 Floral: Romantic and feminine
🍋 Citrus: Fresh and energizing
🌲 Woody: Warm and grounding
🌶️ Oriental: Exotic and spicy
🌊 Aquatic: Clean and modern

When shopping for perfume, pay attention to all three layers. What you smell first isn't always what stays!

Explore our collection at Alariya - each bottle tells a unique story through its notes. ✨`,
        author: "Alariya Team",
        published: true,
        published_at: new Date("2026-02-14"),
        meta_title: "Understanding Perfume Notes: Top, Middle & Base | Alariya",
        meta_description: "Learn about fragrance notes and how they create the perfect scent. A comprehensive guide to perfume composition.",
    },
]

export default async function seedBlogPosts({ container }: ExecArgs) {
    const logger = container.resolve("logger")
    const blogModuleService = container.resolve("blog") as BlogModuleService

    logger.info("Starting blog post seeding...")

    try {
        for (const postData of samplePosts) {
            logger.info(`Creating blog post: ${postData.title}`)

            await blogModuleService.createBlogPosts(postData)

            logger.info(`✓ Created: ${postData.slug}`)
        }

        logger.info(`\n✅ Successfully seeded ${samplePosts.length} blog posts!`)
        logger.info(`\nView them at: http://localhost:8000/bd/blog\n`)
    } catch (error) {
        logger.error(`Error seeding blog posts: ${error.message}`)
        throw error
    }
}
