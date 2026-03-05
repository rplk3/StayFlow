import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { assignBooking } from '@/lib/api';
import { useAppStore } from '@/store/appStore';

const schema = z.object({
  driverId: z.string().min(1),
  vehicleId: z.string().min(1),
});

interface Props {
  bookingId: string;
  onSuccess: () => void;
}

export default function AssignmentForm({ bookingId, onSuccess }: Props) {
  const { drivers, vehicles } = useAppStore();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await assignBooking(bookingId, data);
      onSuccess();
      // eslint-disable-next-line no-alert
      alert('Assigned & Confirmed!');
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Error assigning');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="driverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Driver</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name} ({d.contact})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          name="vehicleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vehicle</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      {v.type} - {v.plateNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button type="submit">Confirm Assignment</Button>
      </form>
    </Form>
  );
}
