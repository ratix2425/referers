import { NextRequest, NextResponse } from 'next/server'
import { RegisterUserViaReferral } from '@/modules/identity/application/use-cases/RegisterUserViaReferral'
import { userRepo, referralTreeRepo, referralAncestorsRepo } from '@/lib/db/repositories'

const registerUseCase = new RegisterUserViaReferral(userRepo, referralTreeRepo, referralAncestorsRepo)

const ERROR_MESSAGES: Record<string, { message: string; status: number }> = {
  INVALID_REFERRAL_CODE: { message: 'Código de referido inválido', status: 400 },
  EMAIL_ALREADY_EXISTS: { message: 'El email ya está registrado', status: 409 },
  INVALID_EMAIL: { message: 'Formato de email inválido', status: 400 },
  INVALID_PASSWORD: { message: 'La contraseña debe tener al menos 8 caracteres', status: 400 },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, referralCode } = body

    if (!email || !password || !referralCode) {
      return NextResponse.json(
        { error: 'Email, contraseña y código de referido son obligatorios' },
        { status: 400 }
      )
    }

    const result = await registerUseCase.execute({ email, password, referralCode })

    if (!result.ok) {
      const { message, status } = ERROR_MESSAGES[result.error] ?? { message: 'Error interno', status: 500 }
      return NextResponse.json({ error: message }, { status })
    }

    return NextResponse.json(result.value, { status: 201 })
  } catch (error) {
    console.error('[POST /api/users/register]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
