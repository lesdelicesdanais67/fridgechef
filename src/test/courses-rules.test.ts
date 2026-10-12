import { describe, expect, it } from 'vitest';
import { addCourse, setCount, transferChecked } from '@/lib/courses-rules';

const item=(name:string,extra={})=>({name,quantity:'',unit:'',...extra});
describe('courses', () => {
  it('Ajouter tout au frigo transfère seulement les articles cochés', () => {
    const r=transferChecked([item('Qqa',{checked:true}),item('Qqb')],['Lait']);
    expect(r.fridge).toEqual(['Lait','Qqa']);
    expect(r.list.map(n=>n.name)).toEqual(['Qqb']);
  });
  it('ajouter un article déjà présent augmente sa quantité', () => {
    expect(addCourse([item('Qqa',{count:1})],item('qqa'))[0]?.count).toBe(2);
  });
  it('la quantité ne descend pas sous 1', () => {
    expect(setCount([item('Qqa',{count:1})],'Qqa',0)[0]?.count).toBe(1);
  });
});
