import apiClient from './client';

export const submitFeedback = async (rating: number, feedbackText: string): Promise<any> => {
    const response = await apiClient.post('/support/feedback', {
        rating,
        feedbackText
    });
    return response.data;
};

export const submitSupportTicket = async (title: string, description: string, screenshotUri: string | null): Promise<any> => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    if (screenshotUri) {
        const filename = screenshotUri.split('/').pop() || 'screenshot.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('screenshot', {
            uri: screenshotUri,
            name: filename,
            type,
        } as any);
    }

    const response = await apiClient.post('/support/ticket', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    
    return response.data;
};
