import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiParseRequest { text: string; country?: string; currency?: string; typeHint?: string; }
export interface AiSuggestionLine { compte: string; libelle: string; debit: number; credit: number; }
export interface AiSuggestion { journalCode: string; piece: string; date: string; lines: AiSuggestionLine[]; confidence: number; }
export interface AiDetection { type: string; date?: string; party?: string; piece?: string; ht?: number; tva?: number; ttc?: number; }
export interface AiParseResponse { detected: AiDetection; suggestions: AiSuggestion[]; }

@Injectable({ providedIn: 'root' })
export class AiService {
	constructor(private http: HttpClient) {}
	parseText(req: AiParseRequest): Observable<AiParseResponse> {
		return this.http.post<AiParseResponse>('/api/ai/parseText', req);
	}
}