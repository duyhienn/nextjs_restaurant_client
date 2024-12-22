import accountApiRequest from '@/apiRequests/account'
import { AccountResType, UpdateEmployeeAccountBodyType } from '@/schemaValidations/account.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useAccountMe = () => {
  return useQuery({
    queryKey: ['account-me'],
    queryFn: accountApiRequest.me,
  })
}
// export const useAccountMe = (onSuccess?: (data: AccountResType) => void) => {
//   return useQuery({
//     queryKey: ['account-profile'],
//     queryFn: async () => {
//       const res = await accountApiRequest.me()
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

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: accountApiRequest.changePasswordV2,
  })
}

export const useGetListEmployeeAccountQuery = () => {
  return useQuery({
    queryKey: ['list-employee'],
    queryFn: accountApiRequest.getListEmployee,
  })
}

export const useGetEmployeeAccountQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => accountApiRequest.getEmployee(id),
    enabled,
  })
}

export const useAddEmployeeAccountMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: accountApiRequest.addEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-employee'] })
    },
  })
}

export const useUpdateEmployeeAccountMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateEmployeeAccountBodyType & { id: number }) =>
      accountApiRequest.updateEmployee(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-employee'], exact: true })
    },
  })
}

export const useDeleteEmployeeAccountMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => accountApiRequest.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list-employee'] })
    },
  })
}
