import {
  Box,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

export default function TransferFormField({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  select = false,
  options = [],
  disabled = false,
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 500,
          mb: 1,
          color: "var(--text-main-color)",
        }}
      >
        {label}
      </Typography>

      <TextField
        fullWidth
        select={select}
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        size="small"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,

            bgcolor: disabled ? "action.hover" : "var(--white-color)",
          },
        }}
        slotProps={{
          input: {
            startAdornment: icon ? (
              <InputAdornment position="start">{icon}</InputAdornment>
            ) : null,
          },
        }}
      >
        {select &&
          options.map((option) => {
            const isObject = typeof option === "object";

            const optionValue = isObject ? option.value : option;

            const optionLabel = isObject ? option.label : option;

            return (
              <MenuItem key={optionValue} value={optionValue}>
                {optionLabel}
              </MenuItem>
            );
          })}
      </TextField>
    </Box>
  );
}
