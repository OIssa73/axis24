
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConstraints() {
  const { data, error } = await supabase.rpc('get_constraints', { t_name: 'categories' })
  if (error) {
    // If RPC doesn't exist, try a raw query if enabled (unlikely)
    console.log("RPC failed, trying manual check via content fetch")
    const { data: categories } = await supabase.from('categories').select('*').limit(1)
    console.log("Sample category:", categories)
  } else {
    console.log("Constraints:", data)
  }
}

checkConstraints()
