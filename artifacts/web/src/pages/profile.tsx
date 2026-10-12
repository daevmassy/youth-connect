import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequestProfilePhotoUploadUrl, useUpdateMe } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle2, LogOut, Camera, X } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  bio: z.string().optional(),
});

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const updateMutation = useUpdateMe();
  const photoUploadMutation = useRequestProfilePhotoUploadUrl();
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    updateMutation.mutate(
      { data: values },
      {
        onSuccess: (res) => {
          updateUser(res.user);
          toast({ description: 'Profile updated successfully.' });
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
        }
      }
    );
  };

  const uploadPhoto = async (file: File) => {
    setPhotoError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Profile photos must be 10 MB or smaller.');
      return;
    }
    try {
      const upload = await photoUploadMutation.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type },
      });
      const response = await fetch(upload.uploadURL, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!response.ok) throw new Error('Photo upload failed.');
      const result = await updateMutation.mutateAsync({ data: { avatarPath: upload.objectPath } });
      updateUser(result.user);
      toast({ description: 'Profile photo updated.' });
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Could not upload the photo.');
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const removePhoto = () => {
    updateMutation.mutate(
      { data: { avatarPath: '' } },
      {
        onSuccess: (result) => {
          updateUser(result.user);
          toast({ description: 'Profile photo removed.' });
        },
        onError: () => setPhotoError('Could not remove the profile photo.'),
      },
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={`${user.firstName}'s profile`} className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-12 h-12" />
            )}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadPhoto(file);
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Add profile photo"
            className="absolute -right-2 -bottom-2 rounded-full shadow"
            onClick={() => photoInputRef.current?.click()}
            disabled={photoUploadMutation.isPending || updateMutation.isPending}
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h1>
          <p className="text-muted-foreground font-mono text-sm">@{user?.username}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 -mt-4">
        <p className="text-xs text-muted-foreground">Optional profile photo · JPG, PNG, or WebP up to 10 MB</p>
        {user?.avatarUrl && (
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={removePhoto} disabled={updateMutation.isPending}>
            <X className="w-4 h-4 mr-1" /> Remove
          </Button>
        )}
      </div>
      {photoError && <p className="text-sm text-destructive">{photoError}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A short bio..." 
                        {...field} 
                        className="resize-none h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="pt-8">
        <Button variant="destructive" onClick={logout} className="gap-2">
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>
    </div>
  );
}
