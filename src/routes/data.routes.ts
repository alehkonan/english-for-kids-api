import { Router } from 'express';
import { IWordWithCategory } from '../customTypes/interfaces';
import { pool } from '../database';

const router = Router();
const categoriesQuery = 'SELECT * FROM public.categories';
const wordsQuery = `SELECT words.id, en, ru, image, audio, category
                  FROM public.words 
                  LEFT JOIN public.categories 
                  ON words.category_id = categories.id`;

router.get('/categories', async (req, res) => {
  try {
    const getCategories = await pool.query(categoriesQuery);
    const getWords = await pool.query(wordsQuery);
    const categories: { id: number, category: string }[] = getCategories.rows;
    const words: IWordWithCategory[] = getWords.rows;
    const result = categories.map((category) => ({
      ...category,
      wordsCount: words.filter((word) => word.category === category.category).length,
      image: words.find((word) => word.category === category.category)?.image || '',
    }));
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.put('/categories', async (req, res) => {
  try {
    let { oldCategory, newCategory }: { oldCategory: string, newCategory: string } = req.body;
    [oldCategory, newCategory] = [oldCategory.toLowerCase(), newCategory.toLowerCase()];
    const check = await pool.query('SELECT * FROM public.categories WHERE category = $1', [oldCategory]);
    if (!check.rowCount) {
      return res.status(400).json(`${oldCategory} doesn't exist`);
    }
    await pool.query('UPDATE public.categories SET category = $1 WHERE category = $2', [newCategory, oldCategory]);
    return res.status(201).json(`category ${oldCategory} has been renamed to ${newCategory}`);
  } catch (e) {
    return res.status(500).json(e.message);
  }
});

router.delete('/categories', async (req, res) => {
  try {
    const { category }: { category: string } = req.body;
    await pool.query('DELETE FROM public.categories WHERE category = $1', [category]);
    return res.status(201).json(`category ${category} has been deleted`);
  } catch (e) {
    return res.status(500).json(e.message);
  }
});

router.post('/categories', async (req, res) => {
  try {
    let { category }: { category: string } = req.body;
    category = category.toLowerCase();
    const check = await pool.query('SELECT * FROM public.categories WHERE category = $1', [category]);
    if (check.rowCount) {
      return res.status(400).json(`${category} is already exists`);
    }
    await pool.query('INSERT INTO public.categories(category) VALUES($1)', [category]);
    return res.status(201).json(`category ${category} added`);
  } catch (e) {
    return res.status(500).json(e.message);
  }
});

router.get('/words', async (req, res) => {
  try {
    const getCategories = await pool.query(categoriesQuery);
    const getWords = await pool.query(wordsQuery);
    const categories: { id: number, category: string }[] = getCategories.rows;
    const words: IWordWithCategory[] = getWords.rows;
    const result = categories
      .map((category) => (
        [
          category.category,
          words
            .filter((word) => word.category === category.category)
            .map((word) => ({
              id: word.id,
              en: word.en,
              ru: word.ru,
              image: word.image,
              audio: word.audio,
              clicked: 0,
              guesed: 0,
              mistakes: 0,
              rightAnswers: 0,
            })),
        ]
      ));
    res.status(200).send(Object.fromEntries(result));
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.put('/words', async (req, res) => {
  try {
    const word: IWordWithCategory = req.body;
    const {
      id, en, ru, image, audio,
    } = word;
    await pool.query('UPDATE public.words SET en = $1, ru = $2, image = $3, audio = $4 WHERE id = $5', [en, ru, image, audio, id]);
    return res.status(201).json(`word ${en} has been changed`);
  } catch (e) {
    return res.status(500).json(e.message);
  }
});

router.delete('/words', async (req, res) => {
  try {
    const { id }: { id: number } = req.body;
    await pool.query('DELETE FROM public.words WHERE id = $1', [id]);
    return res.status(201).json('word has been deleted');
  } catch (e) {
    return res.status(500).json(e.message);
  }
});

router.post('/words', async (req, res) => {
  try {
    const {
      en, ru, image, audio, category,
    }: {
      en: string
      ru: string
      image: string
      audio: string
      category: string
    } = req.body;
    const findCategoryId = await pool.query('SELECT id FROM public.categories WHERE category = $1', [category]);
    const categoryId: number = findCategoryId.rows[0].id || 0;
    const check = await pool.query('SELECT * FROM public.words WHERE en = $1 AND category_id = $2', [en, categoryId]);
    if (check.rowCount) {
      return res.status(400).json(`${en} is already exists in this category`);
    }
    const query = 'INSERT INTO public.words(en, ru, image, audio, category_id) VALUES($1, $2, $3, $4, $5)';
    const values = [en, ru, image, audio, categoryId];
    await pool.query(query, values);
    return res.status(201).json(`word '${en}' added`);
  } catch (e) {
    return res.status(500).json(e.message);
  }
});

export default router;
