import { IsString, IsEthereumAddress } from "class-validator"

export class GetNonceDto {
  @IsEthereumAddress()
  address: string
}

export class VerifySignatureDto {
  @IsEthereumAddress()
  address: string

  @IsString()
  signature: string

  @IsString()
  nonce: string
}
