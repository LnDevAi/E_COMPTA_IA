import { Pipe, PipeTransform } from '@angular/core';
import { DeclarationRecord } from '../../services/declarations.service';

@Pipe({ name: 'typeFilter', standalone: true })
export class TypeFilterPipe implements PipeTransform {
	transform(list: DeclarationRecord[], type?: string): DeclarationRecord[] {
		if (!type) return list; return list.filter(r => r.type === type);
	}
}