import * as React from 'react';
import { Html, Head, Body, Container, Section, Text, Heading, Tailwind, Hr } from '@react-email/components';

export function SpecialistRejectedEmail({ name, reason }: { name: string; reason?: string }) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-200 rounded my-[40px] mx-auto p-[20px] w-[465px] bg-white">
            <Heading className="text-slate-800 text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Elira Health Profile Update
            </Heading>
            <Text className="text-slate-700 text-[14px] leading-[24px]">
              Hello Dr. {name},
            </Text>
            <Text className="text-slate-700 text-[14px] leading-[24px]">
              Thank you for applying to join Elira Health. After careful review, we are unable to approve your application at this time.
            </Text>
            {reason && (
              <Section className="bg-slate-100 p-4 rounded-md my-4">
                <Text className="text-slate-800 text-[14px] m-0 font-medium">Reason:</Text>
                <Text className="text-slate-600 text-[14px] m-0 mt-1">{reason}</Text>
              </Section>
            )}
            <Hr className="border border-solid border-slate-200 my-[26px] mx-0 w-full" />
            <Text className="text-slate-500 text-[12px] leading-[24px]">
              If you believe this was a mistake or have additional documents to provide, please contact our support team.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default SpecialistRejectedEmail;
