import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Button, Tailwind, Hr } from '@react-email/components';

export function AppointmentConfirmedEmail({ 
  name, 
  specialistName, 
  date, 
  time, 
  meetingUrl 
}: { 
  name: string; 
  specialistName: string; 
  date: string; 
  time: string; 
  meetingUrl?: string; 
}) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-200 rounded my-[40px] mx-auto p-[20px] w-[465px] bg-white">
            <Heading className="text-purple-600 text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Appointment Confirmed
            </Heading>
            <Text className="text-slate-700 text-[14px] leading-[24px]">
              Hello {name},
            </Text>
            <Text className="text-slate-700 text-[14px] leading-[24px]">
              Your appointment with <strong>Dr. {specialistName}</strong> has been confirmed!
            </Text>
            <Section className="bg-purple-50 p-4 rounded-md my-4">
              <Text className="text-purple-900 text-[14px] m-0"><strong>Date:</strong> {date}</Text>
              <Text className="text-purple-900 text-[14px] m-0 mt-2"><strong>Time:</strong> {time}</Text>
            </Section>
            {meetingUrl && (
              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-purple-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={meetingUrl}
                >
                  Join Consultation
                </Button>
              </Section>
            )}
            <Hr className="border border-solid border-slate-200 my-[26px] mx-0 w-full" />
            <Text className="text-slate-500 text-[12px] leading-[24px]">
              Please try to join at least 5 minutes before the scheduled time.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default AppointmentConfirmedEmail;
