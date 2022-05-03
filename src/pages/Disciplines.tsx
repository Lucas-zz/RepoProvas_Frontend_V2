import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Term,
  Test,
  TestByDiscipline,
} from "../services/api";

function Disciplines() {
  const { token } = useAuth();

  const navigate = useNavigate();

  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  const termsData = terms?.map(term => term.disciplines);
  const disciplinesName: string[] = [];

  if (termsData) {
    for (let terms of termsData) {
      for (let discipline of terms) {
        disciplinesName.push(discipline.name);
      }
    }
  }

  let filteredDisciplines: any[] = [];

  if (search) {
    terms.forEach((term: TestByDiscipline) => {
      const filter = term.disciplines.filter(el => el.name === search);

      if (filter.length !== 0) filteredDisciplines.push(filter[0]);
    });
  }

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByDiscipline(token);
      setTerms(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token]);

  return (
    <>
      <Divider sx={{ mb: "35px" }}>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={disciplinesName}
          sx={{ width: "80vw", maxWidth: "450px" }}
          onInputChange={(e, value) => setSearch(value)}
          renderInput={(params: any) => (
            <TextField
              {...params}
              sx={{ mx: "auto", width: "80vw", maxWidth: "450px" }}
              label="Pesquise por disciplina"
            />
          )}
        />
      </Divider>
      <Box sx={{ mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10vw",
            paddingBottom: "20vh"
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        {!search
          ? (
            <TermsAccordions categories={categories} terms={terms} />
          )
          : (
            <DisciplinesAccordions categories={categories} disciplines={filteredDisciplines} />
          )
        }
      </Box>
    </>
  );
}

interface TermsAccordionsProps {
  categories: Category[];
  terms: TestByDiscipline[];
}

function TermsAccordions({ categories, terms }: TermsAccordionsProps) {
  return (
    <Box sx={{ mt: "50px" }}>
      {terms.map((term) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{term.number} Período</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisciplinesAccordions
              categories={categories}
              disciplines={term.disciplines}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

interface DisciplinesAccordionsProps {
  categories: Category[];
  disciplines: Discipline[];
}

function DisciplinesAccordions({
  categories,
  disciplines,
}: DisciplinesAccordionsProps) {
  if (disciplines.length === 0)
    return <Typography>Nenhuma prova para esse período...</Typography>;

  return (
    <>
      {disciplines.map((discipline) => (
        <Accordion
          sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
          key={discipline.id}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{discipline.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Categories
              categories={categories}
              teachersDisciplines={discipline.teacherDisciplines}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

interface CategoriesProps {
  categories: Category[];
  teachersDisciplines: TeacherDisciplines[];
}

function Categories({ categories, teachersDisciplines }: CategoriesProps) {
  if (teachersDisciplines.length === 0)
    return <Typography>Nenhuma prova para essa disciplina...</Typography>;

  return (
    <>
      {categories
        .filter(doesCategoryHaveTests(teachersDisciplines))
        .map((category) => (
          <Box key={category.id}>
            <Typography fontWeight="bold">{category.name}</Typography>
            <TeachersDisciplines categoryId={category.id} teachersDisciplines={teachersDisciplines} />
          </Box>
        ))}
    </>
  );
}

interface TeacherDisciplineProps {
  teachersDisciplines: TeacherDisciplines[];
  categoryId: number;
}

function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
  return (category: Category) =>
    teachersDisciplines.filter((teacherDiscipline) =>
      someTestOfThisCategory(teacherDiscipline.tests, category.id)
    ).length > 0;
}

function someTestOfThisCategory(tests: Test[], categoryId: number) {
  return tests.some(test => test.category.id === categoryId);
}

function testOfThisCategory(test: Test, categoryId: number) {
  return test.category.id === categoryId;
}

function TeachersDisciplines({ teachersDisciplines, categoryId }: TeacherDisciplineProps) {
  const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
    tests: teacherDiscipline.tests,
    teacherName: teacherDiscipline.teacher.name,
  }));

  return <Tests categoryId={categoryId} testsWithTeachers={testsWithDisciplines} />;
}

interface TestsProps {
  testsWithTeachers: { tests: Test[]; teacherName: string }[];
  categoryId: number
}

function Tests({ categoryId, testsWithTeachers: testsWithDisciplines }: TestsProps) {
  const { token } = useAuth();

  async function countView(id: number) {
    if (!token) return;

    await api.countView(id, token);
  }

  return (
    <>
      {testsWithDisciplines.map((testsWithDisciplines) =>
        testsWithDisciplines.tests
          .filter(test => testOfThisCategory(test, categoryId))
          .map((test) => (
            <Box sx={{ display: "flex", width: "80vw", gap: "30px", }}>
              <Typography key={test.id} color="#878787">
                <Link
                  onClick={() => countView(test.id)}
                  href={test.pdfUrl}
                  target="_blank"
                  underline="none"
                  color="inherit"
                >{`${test.name} (${testsWithDisciplines.teacherName})`}</Link>
              </Typography>
              <Typography>{`Visualizações: ${test.views}`}</Typography>
            </Box>
          ))
      )}
    </>
  );
}

export default Disciplines;
