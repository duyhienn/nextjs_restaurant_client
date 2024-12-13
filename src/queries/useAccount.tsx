import accountApiRequest from '@/apiRequests/account'
import { AccountResType } from '@/schemaValidations/account.schema'
import { useMutation, useQuery } from '@tanstack/react-query'

export const useAccountMe = () => {
  return useQuery({
    queryKey: ['account-me'],
    queryFn: accountApiRequest.getProfile,
  })
}
// export const useAccountMe = (onSuccess?: (data: AccountResType) => void) => {
//   return useQuery({
//     queryKey: ['account-profile'],
//     queryFn: async () => {
//       const res = await accountApiRequest.getProfile()
//       if (onSuccess) onSuccess(res.payload)
//       return res
//     },
//   })
// }

export const useUpdateMeMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.updateMe,
  })
}
