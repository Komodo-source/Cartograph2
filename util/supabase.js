import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://easgxprkcqrzmaiiptok.supabase.co'
const supabaseAnonKey = 'sb_publishable_eJiVxyg_CPDWtX1Dx-sOzQ_PyRTGGih'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
