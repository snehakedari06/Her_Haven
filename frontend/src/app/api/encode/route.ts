import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        console.log('Encoding image with text:', data.resText);

        const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/encode`,
            null,
            {
                params: {
                    text: data.resText,
                    img_url: data.resImage,
                },
                responseType: 'arraybuffer',
            }
        );

        const base64Image = Buffer.from(res.data, 'binary').toString('base64');
        const dataUrl = `data:image/png;base64,${base64Image}`;

        return NextResponse.json({ encodedImage: dataUrl }, { status: 200 });
    } catch (error) {
        console.error('Encoding failed:', error);
        return NextResponse.json(
            { error: 'Failed to encode image' },
            { status: 500 }
        );
    }
}
