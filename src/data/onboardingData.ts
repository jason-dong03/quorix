
import { type FormData } from "../types";
export const checkOnboardingStatus = async () => {
  try {
    const response = await fetch(
      `http://localhost:4000/api/onboarding/status`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;
    
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    throw error;
  }
};

export const finishOnboarding = async (formData: FormData) =>{
    try{
        const response = await fetch(
        `http://localhost:4000/api/onboarding/finish`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
            'Content-Type': 'application/json', 
            },
            body: JSON.stringify(formData)
        }
        );
        const result = await response.json();

        return result.success;
    }catch (error){
        console.log(`Error finishing onboarding: `, error);
        throw error;
    }
}