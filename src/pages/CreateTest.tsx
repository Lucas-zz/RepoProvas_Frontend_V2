import { Autocomplete, Button, Divider, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/Form";
import useAlert from "../hooks/useAlert";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

interface createTestData {
    name: string,
    pdfUrl: string,
    categoryName: string,
    disciplineName: string,
    teacherName: string,
};

function CreateTest() {
    const { token } = useAuth();
    const { setMessage } = useAlert();

    const navigate = useNavigate();

    const [categories, setCategories] = useState<string[]>([]);
    const [disciplines, setDisciplines] = useState<string[]>([]);
    const [teachers, setTeachers] = useState<string[]>([]);
    const [formData, setFormData] = useState<createTestData>({
        name: "",
        pdfUrl: "",
        categoryName: "",
        disciplineName: "",
        teacherName: "",
    });

    let reload = false;

    useEffect(() => {
        async function reloadPage() {
            if (!token) return;

            const { data: categoriesData } = await api.getCategories(token);
            const categoriesName: string[] = [];
            for (let category of categoriesData.categories) {
                categoriesName.push(category.name);
            }
            setCategories(categoriesName);

            const { data: disciplinesData } = await api.getDisciplines(token);
            const disciplinesName: string[] = [];
            for (let discipline of disciplinesData.disciplines) {
                disciplinesName.push(discipline.name);
            }
            setDisciplines(disciplinesName);

            setTeachers([]);

            setFormData({
                name: "",
                pdfUrl: "",
                categoryName: "",
                disciplineName: "",
                teacherName: "",
            });
        }

        reloadPage();
    }, [reload]);

    function handleDropDownChange(field: string, value: string) {
        setFormData({ ...formData, [field]: value });
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!token) return;

        try {
            await api.addTest(formData, token);

            setMessage({
                type: "success",
                text: "Prova adicionada com sucesso!",
            });

            reload = !reload;
        } catch (error: Error | AxiosError | any) {
            if (error.response) {
                setMessage({
                    type: "error",
                    text: error.response.data.message,
                });
                return;
            }

            setMessage({
                type: "error",
                text: "Ocorreu um erro, tente novamente em alguns instantes."
            });
            console.log(error);
        }
    }

    async function handleDisciplineChange(value: string) {
        if (!token) return;

        if (!value) {
            setTeachers([]);
            setFormData({ ...formData, teacherName: "" });
            return;
        }

        const { data: teacherData } = await api.getTeachersByDiscipline(value, token);
        const teachersName: string[] = [];

        for (let teacher of teacherData.teachers) {
            teachersName.push(teacher.teacher.name);
        }
        setTeachers([]);

        setFormData({ ...formData, teacherName: "" });
        setTeachers(teachersName);

        handleDropDownChange("disciplineName", value);
    }

    return (
        <>
            <Divider sx={{ mb: "35px" }}>
                <Typography
                    sx={{
                        width: "80vw",
                        maxWidth: "450px",
                        display: "flex",
                        justifyContent: "center",
                        fontSize: 16,
                        padding: "15px",
                        border: "1px solid #BBBBBB",
                        borderRadius: "4px",
                        color: "#646464",
                    }}
                >
                    Adicionar uma Prova
                </Typography>
            </Divider>
            <Box sx={{ mx: "auto" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10vw",
                        paddingBottom: "5vh",
                    }}
                >
                    <Button
                        variant="outlined"
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
                    <Button variant="contained" onClick={() => navigate("/app/adicionar")}>
                        Adicionar
                    </Button>
                </Box>
                <Form onSubmit={handleSubmit}>
                    <Box
                        sx={{
                            width: "80vw",
                            maxWidth: "650px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        <TextField
                            fullWidth={true}
                            name="name"
                            type="text"
                            label="Titulo da prova"
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth={true}
                            name="pdfUrl"
                            type="uri"
                            label="PDF da prova"
                            onChange={handleInputChange}
                        />
                        <Autocomplete
                            fullWidth={true}
                            options={categories}
                            autoComplete={true}
                            onInputChange={(e, value) =>
                                handleDropDownChange("categoryName", value)
                            }
                            renderInput={(params) => (
                                <TextField {...params} label="Categoria" />
                            )}
                        />
                        <Autocomplete
                            fullWidth={true}
                            options={disciplines}
                            autoComplete={true}
                            onInputChange={(e, value) => handleDisciplineChange(value)}
                            renderInput={(params) => (
                                <TextField {...params} label="Disciplina" />
                            )}
                        />
                        <Autocomplete
                            fullWidth={true}
                            options={teachers}
                            autoComplete={true}
                            disabled={formData.disciplineName === ""}
                            onInputChange={(e, value) =>
                                handleDropDownChange("teacherName", value)
                            }
                            renderInput={(params) => (
                                <TextField {...params} label="Pessoa Instrutora" />
                            )}
                        />
                        <Button
                            fullWidth={true}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                backgroundColor: "#1976D2",
                                color: "#FFF",
                                padding: "15px"
                            }}
                            type="submit"
                        >
                            Enviar
                        </Button>
                    </Box>
                </Form>
            </Box>
        </>
    );
}
export default CreateTest;