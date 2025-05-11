import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Format the JSON with pretty printing
    const jsonData = JSON.stringify(data, null, 2);
    
    // Path to the pins.json file
    const filePath = path.join(process.cwd(), 'public', 'pins.json');
    
    // Write the file
    await writeFile(filePath, jsonData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving pins:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}