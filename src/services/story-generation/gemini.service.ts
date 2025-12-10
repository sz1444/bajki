import { GoogleGenerativeAI } from '@google/generative-ai'

export interface StoryFormData {
  childName: string
  childAge: number
  storyGenre: string
  storyTone: string
  storyLesson: string
  currentEmotionalChallenge?: string | null
  favoriteFoodPlace?: string | null
  petMascot?: string | null
  requestDialogHumor?: boolean
  siblingsFriends?: string | null
}

export class GeminiService {
  private genAI: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set')
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  /**
   * Generates a story based on form data
   * Target length: ~1500-1800 words (approx 10-12 minutes reading time)
   *
   * Tries gemini-2.5-flash first, falls back to gemini-2.5-pro if overloaded
   */
  async generateStory(storyData: StoryFormData): Promise<string> {
    // Try primary model first (gemini-2.5-pro)
    try {
      console.log('[Gemini] Trying primary model: gemini-2.5-flash')
      const primaryModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      return await this.generateWithModel(storyData, primaryModel, 'gemini-2.5-flash')
    } catch (error: any) {
      const is503Error = error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded')

      if (is503Error) {
        console.log('[Gemini] Primary model overloaded, switching to fallback: gemini-2.5-pro')
        // Try fallback model
        const fallbackModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
        return await this.generateWithModel(storyData, fallbackModel, 'gemini-2.5-pro')
      }

      // If it's not a 503 error, throw it
      throw error
    }
  }

  /**
   * Internal method to generate story with a specific model
   */
  private async generateWithModel(
    storyData: StoryFormData,
    model: any,
    modelName: string
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(storyData)
    const userPrompt = this.buildUserPrompt(storyData)

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`

    console.log(`[Gemini/${modelName}] Generating story with prompt length:`, fullPrompt.length)

    // Retry configuration
    const maxRetries = 3
    const baseDelay = 20000 // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Gemini/${modelName}] Attempt ${attempt}/${maxRetries}`)

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
          generationConfig: {
            maxOutputTokens: 4096, // ~1500-1800 words (reduced from 8192)
            temperature: 0.9,      // High creativity for storytelling
            topP: 0.95,
            topK: 40,
          },
        })

        const response = await result.response
        const text = response.text()

        console.log(`[Gemini/${modelName}] Raw response length:`, text?.length || 0, 'characters')
        console.log(`[Gemini/${modelName}] Bajka:`, text)

        if (!text || text.length < 500) {
          console.error(`[Gemini/${modelName}] Story too short! Full text:`, text)
          throw new Error(`Generated story is too short or empty (${text?.length || 0} chars)`)
        }

        console.log(`[Gemini/${modelName}] ✓ Story generated successfully, length:`, text.length, 'characters')
        return text

      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries
        const is503Error = error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded')

        console.error(`[Gemini/${modelName}] Attempt ${attempt} failed:`, error.message)

        // If it's a 503 error and not the last attempt, retry with exponential backoff
        if (is503Error && !isLastAttempt) {
          const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff: 2s, 4s, 8s
          console.log(`[Gemini/${modelName}] Service overloaded (503). Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        // If it's the last attempt, throw to allow fallback to different model
        if (isLastAttempt) {
          console.error(`[Gemini/${modelName}] All ${maxRetries} attempts failed`)
          throw error
        }
      }
    }

    throw new Error(`Gemini API (${modelName}): Max retries exceeded`)
  }

  /**
   * Builds system prompt tailored to child's age
   */
  private buildSystemPrompt(storyData: StoryFormData): string {
    const age = storyData.childAge

    // Age-appropriate writing style
    let styleGuidelines = ''
    if (age >= 3 && age <= 5) {
      styleGuidelines = `
- Używaj prostego słownictwa i krótkich zdań (5-10 słów)
- Stosuj powtórzenia i rytmiczne struktury
- Opisy powinny być konkretne i wizualne
- Unikaj abstrakcyjnych pojęć
- Używaj dużo dźwiękonaśladowczych słów (bum, chlup, au)
`
    } else if (age >= 6 && age <= 8) {
      styleGuidelines = `
- Używaj bogatszego słownictwa, ale wciąż zrozumiałego
- Zdania mogą być dłuższe (10-15 słów)
- Dodaj więcej szczegółów i opisów
- Możesz wprowadzić lekkie napięcie i zagadki
- Humor i zabawy słowne są mile widziane
`
    } else {
      styleGuidelines = `
- Używaj bardziej złożonych zdań i bogatego słownictwa
- Wprowadź głębsze emocje i motywy
- Dodaj więcej warstw do fabuły
- Możesz używać metafor i porównań
- Narracja może być bardziej subtelna
`
    }

    return `Jesteś doświadczonym autorem bajek dla dzieci w języku polskim. Twoim zadaniem jest stworzyć piękną, angażującą bajkę.

WYTYCZNE DOTYCZĄCE STYLU:
${styleGuidelines}

DŁUGOŚĆ BAJKI:
- Napisz bajkę o długości około 1900-2200 słów (bardzo ważne!)
- Bajka powinna nadawać się do czytania przez około 10-12 minut
- Historia powinna być zwięzła ale kompletna - pełna głębia w zwartej formie
- Rozwijaj kluczowe sceny, unikaj zbędnych szczegółów

STRUKTURA BAJKI:
1. Wprowadzenie (10-15% długości) - przedstawienie bohatera i świata
2. Rozwinięcie (30-40%) - przygoda się zaczyna, pojawiają się wyzwania
3. Kulminacja (20-30%) - największe wyzwanie, moment napięcia
4. Rozwiązanie (20-30%) - lekcja zostaje przyswojona, szczęśliwe zakończenie
5. Morał (5-10%) - subtelne podsumowanie nauki

WAŻNE:
- Pisz w tonie ciepłym, pełnym empatii
- Historia powinna być optymistyczna i dodająca otuchy
- Unikaj strachu i przemocy - zastąp je mądrością i dobrocią
- Pamiętaj, że bajka będzie czytana głośno - używaj melodyjnego języka
- Włącz elementy podane przez rodzica (imię, zwierzęta, miejsca, rodzeństwo)
- Na końcu bajki NIE dodawaj fraz typu "Koniec", "To była bajka o..." - zakończ naturalnie historią

TON NARRACJI:
- Ciepły, łagodny, pełen miłości
- Jakby rodzic czytał dziecku przed snem
- Spokojna narracja, bez pośpiechu
`
  }

  /**
   * Builds user prompt with specific story requirements
   */
  private buildUserPrompt(storyData: StoryFormData): string {
    const {
      childName,
      childAge,
      storyGenre,
      storyTone,
      storyLesson,
      currentEmotionalChallenge,
      favoriteFoodPlace,
      petMascot,
      requestDialogHumor,
      siblingsFriends,
    } = storyData

    // Map genre to Polish description
    const genreDescriptions: Record<string, string> = {
      magiczny_realizm: 'magiczny realizm - świat rzeczywisty z elementami magii',
      klasyczna_basn: 'klasyczna baśń - królestwa, smoki, zamki, magiczne stworzenia',
      przygoda_historyczna: 'przygoda historyczna lub fantastyka naukowa',
      krytyczna_przygoda: 'kryminał lub tajemnicza zagadka do rozwiązania',
      podroz_kosmiczna: 'podróż kosmiczna lub futurystyczny świat',
      fantastyka_zwierzeta: 'świat mówiących zwierząt',
      komedia_absurdalna: 'komedia absurdalna z elementami nonsensu',
    }

    // Map tone to Polish description
    const toneDescriptions: Record<string, string> = {
      relaksacyjny_usypiajacy: 'relaksacyjny, spokojny ton na dobranoc',
      dynamiczny_motywujacy: 'dynamiczny i motywujący ton, pełen energii',
      ciekawy_edukacyjny: 'ciekawy i edukacyjny, z elementami nauki',
    }

    const genre = genreDescriptions[storyGenre] || storyGenre
    const tone = toneDescriptions[storyTone] || storyTone

    let prompt = `Napisz bajkę dla ${childAge}-letniego dziecka o imieniu ${childName}.

GATUNEK: ${genre}
TON: ${tone}
GŁÓWNA LEKCJA/MORAŁ: ${storyLesson}
`

    // Add optional context
    if (petMascot) {
      prompt += `\nULUBIONE ZWIERZĘ/MASKOTKA: ${petMascot} (włącz to zwierzę jako ważną postać w bajce)`
    }

    if (siblingsFriends) {
      prompt += `\nRODZEŃSTWO/PRZYJACIELE: ${siblingsFriends} (włącz te postacie do bajki)`
    }

    if (favoriteFoodPlace) {
      prompt += `\nULUBIONE MIEJSCE/JEDZENIE: ${favoriteFoodPlace} (włącz ten element do fabuły)`
    }

    if (currentEmotionalChallenge) {
      prompt += `\nAKTUALNE WYZWANIE: ${currentEmotionalChallenge} (delikatnie porusz ten temat w bajce, pokazując jak go pokonać)`
    }

    if (requestDialogHumor) {
      prompt += `\n\nUWAGA: Rodzic prosił o więcej dialogu i humoru - dodaj zabawne rozmowy między postaciami i sytuacje komediowe!`
    }

    prompt += `\n\nPAMIĘTAJ:
- Długość: około 1500-1800 słów (to jest KRYTYCZNE wymaganie!)
- Bajka powinna być zwięzła ale kompletna - około 10-12 minut czytania
- Opowiadaj kluczowe sceny, unikaj rozbudowanych opisów
- Bajka powinna mieć początek, rozwinięcie i zakończenie
- Włącz wszystkie podane elementy w naturalny sposób
- Głównym bohaterem jest ${childName}
- Zakończ bajkę w sposób pełen nadziei i radości
- NIE dodawaj nagłówków ani oznaczeń typu "Tytuł:", "Koniec" - tylko czysty tekst bajki

WAŻNE: Ta bajka będzie czytana przez 10-12 minut, więc powinna być zwięzła!
Zacznij od pierwszego zdania bajki i pisz do końca. Nie dodawaj żadnych meta-komentarzy.`

    return prompt
  }
}
