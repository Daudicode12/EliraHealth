import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Button, Tailwind, Hr } from '@react-email/components';

export function ConsultationCompletedEmail({ 
  name, 
  specialistName, 
  dashboardUrl 
}: { 
  name: string; 
  specialistName: string; 
  dashboardUrl: string; 
}) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-200 rounded my-[40px] mx-auto p-[20px] w-[465px] bg-white">
            <Heading className="text-slate-800 text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Consultation Completed
            </Heading>
            <Text className="text-slate-700 text-[14px] leading-[24px]">
              Hello {name},
            </Text>
            <Text className="text-slate-700 text-[14px] leading-[24px]">
              Your consultation with <strong>Dr. {specialistName}</strong> has been successfully completed.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-purple-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={dashboardUrl}
              >
                View Post-Consultation Notes
              </Button>
            </Section>
            <Hr className="border border-solid border-slate-200 my-[26px] mx-0 w-full" />
            <Text className="text-slate-500 text-[12px] leading-[24px]">
              We wish you the best of health. If you need any further assistance, do not hesitate to contact us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ConsultationCompletedEmail;
