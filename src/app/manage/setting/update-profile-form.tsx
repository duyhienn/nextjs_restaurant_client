/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useMemo, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { ControllerRenderProps, FieldValues, useForm } from 'react-hook-form'
import { UpdateMeBody, UpdateMeBodyType } from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAccountMe, useUpdateMeMutation } from '@/queries/useAccount'
import { useUploadMediaMutation } from '@/queries/useMedia'
import { toast } from '@/hooks/use-toast'
import { handleErrorApi } from '@/lib/utils'

export default function UpdateProfileForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const { data, refetch } = useAccountMe()
  const updateMeMutation = useUpdateMeMutation()
  const uploadMediaMutation = useUploadMediaMutation()
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      avatar: undefined,
    },
  })

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.payload.data.name,
        avatar: data.payload.data.avatar ?? undefined,
      })
    }
  }, [data])

  const avatar = form.watch('avatar')
  const name = form.watch('name')
  const previewImage = file ? URL.createObjectURL(file) : avatar

  useEffect(() => {
    // Cleanup when file changes or component unmounts
    return () => {
      if (file) {
        URL.revokeObjectURL(previewImage ?? '')
      }
    }
  }, [file, previewImage])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: ControllerRenderProps<UpdateMeBodyType>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
      field.onChange('http://localhost:3000/' + field.name)
    }
  }

  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return
    try {
      let body = values
      if (file) {
        const formData = new FormData()
        formData.append('avatar', file)
        const uploadImgRes = await uploadMediaMutation.mutateAsync(formData)
        const imageUrl = uploadImgRes.payload.data
        body = { ...values, avatar: imageUrl }
      }
      const result = await updateMeMutation.mutateAsync(body)
      setFile(null)
      toast({
        title: 'Update profile success',
        description: 'Your profile has been updated successfully',
      })
      refetch()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  console.log('co re-render khong')
  return (
    <Form {...form}>
      <form
        noValidate
        className='grid auto-rows-max items-start gap-4 md:gap-8'
        onReset={() => {
          form.reset()
          setFile(null)
        }}
        onSubmit={form.handleSubmit(onSubmit)}>
        <Card x-chunk='dashboard-07-chunk-0'>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6'>
              <FormField
                control={form.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex gap-2 items-start justify-start'>
                      <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
                        <AvatarImage className='object-cover' src={previewImage} />
                        <AvatarFallback className='rounded-none'>{name}</AvatarFallback>
                      </Avatar>
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        ref={inputRef}
                        onChange={(e) => handleFileChange(e, field)}
                      />
                      <button
                        className='flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed'
                        type='button'
                        onClick={() => inputRef.current?.click()}>
                        <Upload className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-3'>
                      <Label htmlFor='name'>Name</Label>
                      <Input id='name' type='text' className='w-full' {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className=' items-center gap-2 md:ml-auto flex'>
                <Button variant='outline' size='sm' type='reset'>
                  Cancel
                </Button>
                <Button size='sm' type='submit'>
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
